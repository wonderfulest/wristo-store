export interface CategoryPageState {
  currentPage: number
  failedPage: number | null
  hasMore: boolean
}

export interface CategoryPageRequest {
  page: number
}

export const beginCategoryPageRequest = (state: CategoryPageState, reset: boolean): CategoryPageRequest => ({
  page: reset ? 1 : (state.failedPage ?? state.currentPage + 1),
})

export const commitCategoryPageSuccess = (
  _state: CategoryPageState,
  request: CategoryPageRequest,
  itemCount: number,
  pageSize: number,
): CategoryPageState => ({
  currentPage: request.page,
  failedPage: null,
  hasMore: itemCount === pageSize,
})

export const commitCategoryPageFailure = (
  state: CategoryPageState,
  request: CategoryPageRequest,
): CategoryPageState => ({
  currentPage: state.currentPage,
  failedPage: request.page,
  hasMore: state.hasMore,
})
