import { GetStaticPaths, GetStaticProps } from 'next';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import { api } from '../../services/api';

import styles from './episode.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';

type ParamsEpisode = {
  _limit?: number;
  _sort?: string;
  _order?: string;
}

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = useContext(PlayerContext);

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          alt={episode.title}
          objectFit="cover"
        />

        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const params: ParamsEpisode = {
    _limit: 2,
    _sort: 'published_at',
    _order: 'desc'
  }

  const { data } = await api.get('/episodes', {
    params
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  });

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    url: data.file.url
  }

  return {
    props: { episode },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}