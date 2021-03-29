import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const Comments = (): JSX.Element => {
  const router = useRouter();
  const comments = <div id="inject-comments-for-uterances" />;

  useEffect(() => {
    const scriptElem = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    anchor.innerHTML = '';
    scriptElem.src = 'https://utteranc.es/client.js';
    scriptElem.async = true;
    scriptElem.crossOrigin = 'anonymous';
    scriptElem.setAttribute('repo', 'eduardoluizdev/ignite-nextjs-blog');
    scriptElem.setAttribute('issue-term', 'parthname');
    scriptElem.setAttribute('theme', 'github-dark');
    scriptElem.setAttribute('label', 'blog-comment');
    anchor.appendChild(scriptElem);
  }, [router.asPath]);

  return comments;
};
