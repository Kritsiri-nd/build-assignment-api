
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:tab27Af8127*@localhost:5432/assignment",
});

export default connectionPool;
