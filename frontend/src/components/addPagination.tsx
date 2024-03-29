import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  totalPage: number;
  currentPage: number;
  setPage: (page: number) => void;
};

export function AddPagination(props: Props) {
  const paginationTags = () => {
    const start = props.currentPage - 3 <= 0 ? 0 : props.currentPage - 3;
    let limit = 0;

    // current page is 0 and total page is greater than 7
    if (props.currentPage <= 0 && props.totalPage > 7) {
      limit = props.currentPage + 7;
    }
    // current page is 0 and total page is greater than 7
    else if (props.currentPage <= 0 && props.totalPage < 7) {
      limit = props.totalPage;
    }
    // total page is greater than current page + 4
    else if (props.totalPage > props.currentPage + 4) {
      limit = props.currentPage + 4;
    } else {
      limit = props.totalPage;
    }

    const setPage = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, page: number) => {
      event.preventDefault();
      props.setPage(page);
    };

    const pagination_elements = [
      <PaginationItem key={"prev"}>
        <PaginationPrevious className='cursor-pointer' onClick={(e) => setPage(e, props.currentPage > 0 ? props.currentPage - 1 : 0)} />
      </PaginationItem>,
    ];

    if (props.currentPage > 3) {
      pagination_elements.push(
        <PaginationItem key={"prev_ellipsis"}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = start; i < limit; i++) {
      pagination_elements.push(
        <PaginationItem key={i}>
          <PaginationLink className='cursor-pointer' onClick={(e) => setPage(e, i)} isActive={i === props.currentPage}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (props.totalPage > limit) {
      pagination_elements.push(
        <PaginationItem key={"next_ellipsis"}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    pagination_elements.push(
      <PaginationItem key={"next"}>
        <PaginationNext
          className='cursor-pointer'
          onClick={(e) => setPage(e, props.currentPage < props.totalPage - 1 ? props.currentPage + 1 : props.totalPage - 1)}
        />
      </PaginationItem>
    );

    return pagination_elements;
  };

  return (
    <div className=''>
      <Pagination>
        <PaginationContent>{paginationTags()}</PaginationContent>
      </Pagination>
    </div>
  );
}
