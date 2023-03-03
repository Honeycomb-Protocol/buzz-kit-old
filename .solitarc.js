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
  idlHook: (idl) => {
    // idl.types = idl.types.filter((type) => type.name !== "IndexedReference");
    idl.types.push({
      name: "IndexedReference",
      type: {
        kind: "struct",
        fields: [
          {
            name: "addressContainerIndex",
            type: "u8",
          },
          {
            name: "indexInContainer",
            type: "u8",
          },
        ],
      },
    });
    return idl;
  },
};
