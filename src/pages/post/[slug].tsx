import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { Fragment, useMemo } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  const estimatedReadTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const wordsPerMinute = 200;

    const contentWords = post.data.content.reduce(
      (summedContents, currentContent) => {
        const headingWords = currentContent.heading.split(/\s/g).length;
        const bodyWords = currentContent.body.reduce(
          (summedBodies, currentBody) => {
            const textWords = currentBody.text.split(/\s/g).length;

            return summedBodies + textWords;
          },
          0
        );

        return summedContents + headingWords + bodyWords;
      },
      0
    );

    const minutes = contentWords / wordsPerMinute;
    const readTime = Math.ceil(minutes);

    return readTime;
  }, [post, router.isFallback]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
        <meta name="description" content={post.data.title} />
      </Head>
      <Header />

      <section
        className={styles.banner}
        data-testid="banner"
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />

      <main className={`${commonStyles.container} ${styles.postContent}`}>
        <section className={styles.headerPost}>
          <h1>{post.data.title}</h1>

          <section className={styles.infosContent}>
            <div>
              <FiCalendar />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock />
              <span>{estimatedReadTime} min</span>
            </div>
          </section>
        </section>

        <article>
          {post.data.content.map(({ heading, body }) => {
            return (
              <Fragment key={heading}>
                <h2>{heading}</h2>
                <div
                  className={styles.contentArticle}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(body),
                  }}
                />
              </Fragment>
            );
          })}

          {preview && (
            <aside className={styles.exitPreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo preview</a>
              </Link>
            </aside>
          )}

          <div className={commonStyles.container}>
            <Comments />
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params: { slug },
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post: response,
      preview,
    },
  };
};
