import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const getEstimatedReadingTime = (value: Post): any => {
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

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling.</title>
      </Head>
      <main>
        {router.isFallback && <p>Carregando...</p>}
        <div className={styles.postBanner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <article className={commonStyles.content}>
          <header className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div>
              <span>
                <FiCalendar />
                {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {estimatedReadingTime} min
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response?.data.content.map(i => {
        return {
          heading: i.heading,
          body: i.body,
        };
      }),
    },
  };

  return {
    props: { post },
  };
};
