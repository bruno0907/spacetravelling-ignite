import Link from 'next/link';

import styles from './styles.module.scss';

function PreviewModeButton(): JSX.Element {
  return (
    <aside className={styles.previewButton}>
      <Link href="/api/exit-preview">
        <a>Sair do modo de Preview</a>
      </Link>
    </aside>
  );
}

export { PreviewModeButton };
