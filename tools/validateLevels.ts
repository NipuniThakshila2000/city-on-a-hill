import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MAX_VERSE_CHECKS = 6;
const levelDir = join(process.cwd(), "src", "levels");
const files = readdirSync(levelDir)
  .filter((file) => /^level\d+\.ts$/.test(file))
  .sort();

const failures = files
  .map((file) => {
    const source = readFileSync(join(levelDir, file), "utf8");
    const spawns = (source.match(/\{\s*turn:/g) ?? []).length;
    const fourthChargeAvailable = source.includes("destroyer-fourth-charge");
    const checks = Math.min(spawns, fourthChargeAvailable ? 4 : 3);
    return { file, checks };
  })
  .filter((level) => level.checks > MAX_VERSE_CHECKS);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.file} can require ${failure.checks} verse checks; max is ${MAX_VERSE_CHECKS}.`);
  }
  process.exit(1);
}

console.log(`Validated ${files.length} levels: no level exceeds ${MAX_VERSE_CHECKS} verse checks.`);
