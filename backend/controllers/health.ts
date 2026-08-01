export const healthController = async () => {
  try {
    return Response.json({
      message: "Backend is healthy",
    });
  } catch {
    return Response.json(
      {
        message: "Backend is unhealthy",
      },
      {
        status: 503,
      },
    );
  }
};
