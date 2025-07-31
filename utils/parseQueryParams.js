const parseQueryParams = (queryParams) => {
  let { page, limit, q, ...filters } = queryParams;

  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const skip = Math.max(0, (page - 1) * limit);

  return { limit, q, skip, filters };
};

export default parseQueryParams;
