import { useEffect, useRef } from 'react';

import styles from './styles.module.scss';

function Comments(): JSX.Element {
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
