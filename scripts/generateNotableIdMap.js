/**
 * Parses a skill tree json file and generates a mapping of ascendancy
 * notable node names to skill node ids, for the purposes of generating
 * trade site links
 *
 * skill tree json files can be found here:
 * https://github.com/poe-tool-dev/passive-skill-tree-json
 */
const fs = require("fs");
const path = require("path");

if (process.argv.length !== 3) {
  console.error("must pass skill tree json as argument");
  process.exit(1);
}

let skillTreeJson;
try {
  skillTreeJson = JSON.parse(fs.readFileSync(process.argv[2]));
} catch (e) {
  console.error("could not parse skill tree file:", e);
  process.exit(1);
}

// Pre-populate with known hidden ascendancy nodes, as those are not found
// in the skill tree data
const notableMap = {
  "Fury of Nature": 18054,
  "Unleashed Potential": 19355,
  "Nine Lives": 27602,
  "Searing Purity": 57568,
  "Indomitable Resolve": 52435,
  "Fatal Flourish": 42469,
};

Object.entries(skillTreeJson.nodes).forEach(([nodeId, node]) => {
  if (
    (node.isNotable === true || node.isMultipleChoiceOption === true) &&
    node.ascendancyName !== undefined
  ) {
    notableMap[node.name] = parseInt(nodeId);
  }
});

const outpath = path.join(__dirname, "../src/generated/notableIdMap.json");
fs.writeFileSync(outpath, JSON.stringify(notableMap));
console.log(`Wrote notables to ${outpath}`);
