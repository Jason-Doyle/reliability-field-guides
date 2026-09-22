import {
  contractDefinitions,
  validateArtifactFile,
} from './contract-validation.mjs';

function usage() {
  return (
    'Usage: npm run validate -- [--contract <contract>] <artifact.json> ' +
    '[artifact.json ...]\nContracts: ' +
    contractDefinitions.map((definition) => definition.key).join(', ')
  );
}

function parseArguments(arguments_) {
  const filePaths = [];
  let contractKey;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === '--contract') {
      contractKey = arguments_[index + 1];

      if (!contractKey) {
        throw new Error(`Missing value for --contract.\n${usage()}`);
      }

      index += 1;
      continue;
    }

    if (argument.startsWith('--contract=')) {
      contractKey = argument.slice('--contract='.length);
      continue;
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown option ${argument}.\n${usage()}`);
    }

    filePaths.push(argument);
  }

  if (filePaths.length === 0) {
    throw new Error(usage());
  }

  return {
    contractKey,
    filePaths,
  };
}

try {
  const {
    contractKey,
    filePaths,
  } = parseArguments(process.argv.slice(2));

  for (const filePath of filePaths) {
    const result = await validateArtifactFile(filePath, contractKey);
    console.log(
      `Validated ${result.resolvedPath} against ` +
        `${result.contractKey} ${result.definition.schemaVersion}.`,
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
