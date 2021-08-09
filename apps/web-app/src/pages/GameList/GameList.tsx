import * as React from 'react';
import { useQuery } from '@apollo/client';
import { useHistory, useLocation } from 'react-router-dom';
import cn from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FiGrid } from 'react-icons/fi';
import { BsViewList } from 'react-icons/bs';
import { Game, GamesQueryParams, GamesQueryResponse } from '@game-store-monorepo/data-access';
import { GET_GAMES } from 'src/graphql/queries';
import PlatformLogos from 'src/components/PlatformLogos';
import { getMultipleGenreNames } from '@game-store-monorepo/util';
import Card from 'src/components/Card';
import { ROUTES } from 'src/routes/routes';
import Spinner from 'src/components/Spinner';
import { NavigationContext } from 'src/context/navigation';
import ButtonGroup from 'src/components/ButtonGroup';

type ViewType = 'Grid' | 'List';

const GameList: React.FC = () => {
  const [viewType, setViewType] = React.useState<ViewType>('Grid');
  const { push } = useHistory();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const { setTitle } = React.useContext(NavigationContext);
  const gridClass = cn({
    'grid-cols-2 gap-2': viewType === 'Grid',
    'grid-cols-1 gap-4': viewType === 'List',
  });

  const queryParams: GamesQueryParams = {
    variables: {
      page: 1,
      pageSize: 10,
      dates: searchParams.get('dates') || undefined,
      ordering: searchParams.get('ordering') || undefined,
    },
  };

  const { data, loading, fetchMore } = useQuery<GamesQueryResponse>(GET_GAMES, queryParams);
  const gameResults = data?.allGames.results;
  const nextPage = data?.allGames.nextPage;
  const hasMore = nextPage ? true : false;

  React.useEffect(() => {
    setTitle('Games');
  }, [setTitle]);

  const handleFetchMore = React.useCallback(() => {
    fetchMore({
      variables: {
        page: nextPage,
      },
    });
  }, [fetchMore, nextPage]);

  const onItemClick = (value: Game) => {
    return () => {
      push(`${ROUTES.GAMES}/${value.id}`);
    };
  };

  const onViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  return (
    <Spinner isLoading={loading}>
      <div className="grid grid-cols-2 gap-2 items-center mb-5">
        <div>Display options:</div>
        <div>
          <ButtonGroup isFullWidth value={viewType} onChange={onViewTypeChange}>
            <ButtonGroup.Item selectedValue="Grid" className="w-1/2" size="small">
              <FiGrid size={16} />
            </ButtonGroup.Item>
            <ButtonGroup.Item selectedValue="List" className="w-1/2" size="small">
              <BsViewList size={16} />
            </ButtonGroup.Item>
          </ButtonGroup>
        </div>
      </div>
      <InfiniteScroll
        className={cn(gridClass, 'grid grid-flow-row overflow-hidden pb-12 relative')}
        dataLength={gameResults?.length || 0}
        scrollableTarget="main-layout-content"
        scrollThreshold="50px"
        next={handleFetchMore}
        hasMore={hasMore}
        loader={
          <div className="w-full h-10 absolute bottom-2 ml-2">
            <Spinner isLoading={true} theme="ClipLoader" />
          </div>
        }
      >
        {gameResults?.map((item) => {
          const { id, name, thumbnailImage, parentPlatforms, genres } = item;
          return (
            <Card key={id} headerImageUrl={thumbnailImage} isCompact onClick={onItemClick(item)}>
              {name && <p className="font-semibold truncate  mb-1">{name}</p>}
              <div>
                <PlatformLogos data={parentPlatforms} amount={5} className="mt-1" />
                <p className="mt-2 text-sm text-base-content-secondary truncate">{`${getMultipleGenreNames(
                  genres,
                  2,
                )}`}</p>
              </div>
            </Card>
          );
        })}
      </InfiniteScroll>
    </Spinner>
  );
};

export default GameList;
