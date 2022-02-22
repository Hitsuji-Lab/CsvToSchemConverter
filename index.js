const { Vec3 } = require("vec3");
const { Schematic } = require("prismarine-schematic");
const {
  getStateId,
  parseBlockName,
} = require("prismarine-schematic/lib/states");
const minecraftData = require("minecraft-data");

function parseCsv(csvContent) {
  const row = csvContent.split(/\n/g).map((row) => row.split(/,/g));
  const header = row.shift();
  return {
    header,
    data: row,
    col(col_name) {
      return this.header.indexOf(col_name);
    },
  };
}
/**
 * 
 * @param {string} version 1.18.1
 * @param {string} csvText 
 * @returns {Promise<Buffer>}
 */
function Convert(version, csvText) {
  const csv = parseCsv(csvText);
  const mcData = minecraftData(version);

  const pX = csv.col("Px");
  const pY = csv.col("Py");
  const pZ = csv.col("Pz");
  const blockName = csv.col("block");

  const min = new Vec3(0, 0, 0),
    max = new Vec3(0, 0, 0);

  const pallete = [];
  const air = parseBlockName("air");
  const stateId = getStateId(mcData, air.name, air.properties);
  pallete.push(stateId);

  csv.data.forEach((row) => {
    const x = parseFloat(row[pX]);
    const y = parseFloat(row[pY]);
    const z = parseFloat(row[pZ]);
    row[pX] = x;
    row[pY] = y;
    row[pZ] = z;

    const block = parseBlockName(row[blockName] ?? "stone");

    const stateId = getStateId(mcData, block.name, block.properties);

    let palleteId = pallete.indexOf(stateId);
    if (palleteId < 0) {
      palleteId = pallete.push(stateId) - 1;
    }

    row[blockName] = palleteId;

    if (x < min.x) min.x = x;
    if (y < min.y) min.y = y;
    if (z < min.z) min.z = z;

    if (x > max.x) max.x = x;
    if (y > max.y) max.y = y;
    if (z > max.z) max.z = z;
  });
  const size = max.subtract(min).add(new Vec3(1, 1, 1));

  const blocks = Array(size.x * size.y * size.z);
  csv.data.forEach((row) => {
    const x = row[pX] - min.x;
    const y = row[pY] - min.y;
    const z = row[pZ] - min.z;
    const idx = (y * size.z + z) * size.x + x;

    blocks[idx] = row[blockName];
  });

  const schem = new Schematic(
    version,
    size,
    new Vec3(0, 0, 0),
    pallete,
    blocks
  );
  return schem.write();
}
module.exports = { Convert };
