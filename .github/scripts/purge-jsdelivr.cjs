const { execFileSync } = require('node:child_process');
const { appendFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');

async function main() {
  const version = process.env.RELEASE_VERSION;
  if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
    throw new Error('RELEASE_VERSION must be an exact stable version');
  }
  // Read the actual published file list, including every per-year JSON/ICS file.
  let pack;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      [pack] = JSON.parse(
        execFileSync(
          'npm',
          [
            'pack',
            `chinese-days@${version}`,
            '--dry-run',
            '--json',
            '--prefer-online',
          ],
          { encoding: 'utf8', timeout: 30000 }
        )
      );
      if (pack.version !== version)
        throw new Error('Published version mismatch');
      break;
    } catch (error) {
      if (attempt === 9) throw error;
      console.log('Waiting 30 seconds for npm registry propagation');
      await delay(30000);
    }
  }
  // Allow CDN version metadata to catch up before invalidating cached aliases.
  await delay(60000);
  const paths = [
    '',
    '/package.json',
    ...pack.files
      .filter(file => file.path.startsWith('dist/'))
      .map(file => `/${file.path}`),
  ];
  const failures = [];
  for (const alias of ['', '@latest']) {
    for (const path of paths) {
      const url = `https://purge.jsdelivr.net/npm/chinese-days${alias}${path}`;
      let success = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(30000),
          });
          const result = await response.json();
          if (
            !response.ok ||
            result.status !== 'finished' ||
            !result.paths ||
            Object.keys(result.paths).length === 0 ||
            Object.values(result.paths).some(
              path =>
                !path.throttled &&
                (!path.providers ||
                  Object.values(path.providers).some(
                    provider => provider !== true
                  ))
            )
          ) {
            throw new Error(JSON.stringify(result));
          }
          // A throttled request was recently purged; jsDelivr skips the duplicate.
          console.log(`Refreshed ${url}`);
          success = true;
          break;
        } catch (error) {
          console.error(`Attempt ${attempt + 1}: ${url}: ${error.message}`);
          if (attempt < 2) await delay(10000 * (attempt + 1));
        }
      }
      if (!success) failures.push(url);
    }
  }
  if (failures.length)
    throw new Error(`Failed to purge: ${failures.join(', ')}`);
  // A successful purge only confirms invalidation, not that npm metadata propagated.
  for (const alias of ['', '@latest']) {
    let verified = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(
          `https://cdn.jsdelivr.net/npm/chinese-days${alias}/package.json`,
          { signal: AbortSignal.timeout(30000) }
        );
        const pkg = await response.json();
        if (!response.ok || pkg.version !== version)
          throw new Error(`CDN serves ${pkg.version}; expected ${version}`);
        verified = true;
        break;
      } catch (error) {
        console.error(error.message);
        if (attempt < 4) {
          await delay(60000);
          await fetch(
            `https://purge.jsdelivr.net/npm/chinese-days${alias}/package.json`,
            { signal: AbortSignal.timeout(30000) }
          );
        }
      }
    }
    if (!verified)
      throw new Error(
        `CDN ${alias || 'default'} did not converge to ${version}; retry this job later.`
      );
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `Refreshed ${paths.length * 2} jsDelivr URLs for chinese-days ${version}.\n`
    );
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
