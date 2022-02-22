const { readFileSync, writeFileSync } = require("fs");

const { Convert } = require("../");

Convert("1.18.1", readFileSync("../test/export.csv",{encoding: "utf8"})).then((buff) => {
  writeFileSync("export.schem", buff);
});
