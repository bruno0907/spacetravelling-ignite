import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

// import { FiUser, FiCalendar } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { PostLink } from '../components/PostLink';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { PreviewModeButton } from '../components/PreviewModeButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}
interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [nextLink, setNextLink] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const loadMorePosts = async (nextPage: string): Promise<void> => {
    const result = await fetch(nextPage);
    const data = await result.json();
    const newPostPagination = {
      nextPage: data.next_page,
      results: data.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: post.data,
        };
      }),
    };
    setNextLink(newPostPagination.nextPage);

    setPosts(prevState => [...prevState, ...newPostPagination.results]);
  };

  return (
    <>
      <Head>
        <title>spacetravelling | Home</title>
      </Head>
      <div className={commonStyles.container}>
        <main className={styles.homeContent}>
          {!posts ? (
            <p>Carregando...</p>
          ) : (
            posts.map((post: Post) => <PostLink key={post.uid} post={post} />)
          )}
          {nextLink && (
            <button
              type="button"
              className={styles.loadMorePostsButton}
              onClick={() => loadMorePosts(nextLink)}
            >
              Carregar mais posts
            </button>
          )}
          {preview && <PreviewModeButton />}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      };
    }),
  };

  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
