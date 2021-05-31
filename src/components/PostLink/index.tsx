import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import styles from './styles.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostProps {
  post: Post;
}

function PostLink({ post }: PostProps): JSX.Element {
  return (
    <Link href={`/post/${post.uid}`} key={post.uid}>
      <a>
        <article className={styles.posts}>
          <h1>{post.data.title}</h1>
          <p>{post.data.subtitle}</p>
          <footer>
            {post.first_publication_date && (
              <span>
                <FiCalendar />
                <time className={styles.publicationDate}>
                  {format(new Date(post.first_publication_date), `d MMM y`, {
                    locale: ptBR,
                  })}
                </time>
              </span>
            )}
            <span>
              <FiUser />
              {post.data.author}
            </span>
          </footer>
        </article>
      </a>
    </Link>
  );
}

export { PostLink };
