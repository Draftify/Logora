import { logger } from "../logger/logger";

const dataFilePath = `${import.meta.dir}/../data/simulation-events.json`;

export async function getSimulatedDataController() {
  try {
    const data = await Bun.file(dataFilePath).json();
    return Response.json(data);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to read data file",
    );
    return Response.json({ message: "Failed to load data" }, { status: 500 });
  }
}
