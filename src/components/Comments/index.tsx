import { useEffect, useRef } from 'react';

import styles from './styles.module.scss';

type Post = {
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
};

interface Props {
  post?: Post;
}

function Comments({ post }: Props): JSX.Element {
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const comment = commentRef.current;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'bruno0907/spacetravelling-ignite');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('label', 'comments :speech_baloon:');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    comment.appendChild(script);

    return () => {
      comment.removeChild(comment.firstElementChild);
    };
  });

  return <div className={styles.comments} ref={commentRef} />;
}

export { Comments };
