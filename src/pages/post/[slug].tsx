import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { PreviewModeButton } from '../../components/PreviewModeButton';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface Navigation {
  slug: string;
  title: string;
}
interface PostProps {
  post: Post;
  navigation: Navigation[];
  preview: boolean;
}

export default function Post({
  post,
  navigation,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const navOptions = navigation.findIndex(
    option => option.title === post.data.title
  );

  const previousPost = navigation[navOptions - 1];
  const nextPost = navigation[navOptions + 1];

  const getEstimatedReadingTime = (value: Post): number => {
    const wordsPerMinute = 200;
    const totalWordsInBody = RichText.asText(
      value.data.content.reduce((acc, { body }) => [...acc, ...body], [])
    ).split(' ').length;

    const totalWordsInHeading = RichText.asText(
      value.data.content.reduce((acc, { heading }) => {
        if (heading) {
          return [...acc, ...heading.split('')];
        }
        return [...acc];
      }, [])
    ).split(' ').length;

    return Math.ceil((totalWordsInBody + totalWordsInHeading) / wordsPerMinute);
  };

  const estimatedReadingTime = getEstimatedReadingTime(post);

  return router.isFallback ? (
    <h1>Carregando...</h1>
  ) : (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling.</title>
      </Head>
      <main>
        <header className={styles.postBanner}>
          <img src={post.data.banner.url} alt="banner" />
        </header>
        <article className={commonStyles.content}>
          <header className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div>
              <div>
                {post.first_publication_date && (
                  <span>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                )}
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
                <span>
                  <FiClock />
                  {estimatedReadingTime} min
                </span>
              </div>
              <span>
                {post.last_publication_date &&
                  format(
                    new Date(post.last_publication_date),
                    "'*editado 'd MMM yyyy' às 'p'",
                    {
                      locale: ptBR,
                    }
                  )}
              </span>
            </div>
          </header>
          <div className={styles.postBody}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
          <footer className={styles.postFooter}>
            <hr />
            {preview ? (
              <PreviewModeButton />
            ) : (
              <>
                <nav>
                  {previousPost && (
                    <div className={previousPost && styles.hasPrevious}>
                      <span>{previousPost?.title}</span>
                      <Link href={`/post/${previousPost?.slug}`}>
                        <a>Post anterior</a>
                      </Link>
                    </div>
                  )}
                  {nextPost && (
                    <div>
                      <span>{nextPost?.title}</span>
                      <Link href={`/post/${nextPost?.slug}`}>
                        <a>Próximo post</a>
                      </Link>
                    </div>
                  )}
                </nav>
                <Comments post={post} />
              </>
            )}
          </footer>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
  preview = false,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  try {
    const response = await prismic.getByUID('posts', String(slug), {
      ref: previewData?.ref ?? null,
    });

    const post = {
      uid: response?.uid ?? null,
      first_publication_date: response?.first_publication_date ?? null,
      last_publication_date: response?.last_publication_date ?? null,
      data: {
        title: response?.data.title ?? null,
        subtitle: response?.data.subtitle ?? null,
        author: response?.data.author ?? null,
        banner: {
          url: response?.data.banner.url ?? null,
        },
        content:
          response?.data.content.map(content => {
            return {
              heading: content.heading,
              body: content.body,
            };
          }) ?? [],
      },
    };

    const posts = await prismic.query(
      [Prismic.Predicates.at('document.type', 'posts')],
      {
        fetch: ['posts.title'],
        ref: previewData?.ref ?? null,
      }
    );

    const navigation = posts.results.map(result => {
      return {
        slug: result.uid,
        title: result.data.title,
      };
    });

    return {
      props: {
        post,
        navigation,
        preview,
      },
    };
  } catch (error) {
    console.log(error.message);
  }

  return {
    props: {},
  };
};
