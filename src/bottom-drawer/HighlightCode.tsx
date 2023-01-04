import { ReactNode, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import '../css/prism.css';

export default function HighlightCode(props: { code: ReactNode }) {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return <code className='language-json' children={props.code} />;
}
