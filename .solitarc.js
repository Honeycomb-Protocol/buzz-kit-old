const path = require("path");

const programId = "38foo9CSfPiPZTBvNhouNaYpvkzKEzWW396PUW2GKPVA";
const prefix = "hpl buzz";
const programName = "guild kit"; // with spaces
const programFullName = prefix + " " + programName;

module.exports = {
  idlGenerator: "anchor",
  programName: programFullName.replaceAll(" ", "_"),
  programId,
  idlDir: path.join(__dirname, "packages", "idl"),
  sdkDir: path.join(
    __dirname,
    "packages",
    programFullName.replaceAll(" ", "-"),
    "generated"
  ),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(
    __dirname,
    "programs",
    programName.replaceAll(" ", "-")
  ),
};
