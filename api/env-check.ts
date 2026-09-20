// TEMPORARY diagnostic: lists names (never values) of key-like variables. Delete after use.
export default function handler(_req: any, res: any) {
  const matches = Object.keys(process.env)
    .filter((k) => /GEMINI|GOOGLE|GENAI|API_?KEY/i.test(k))
    .map((k) => ({ name: JSON.stringify(k), valueLength: (process.env[k] || '').length }));
  res.status(200).json({
    vercelEnv: process.env.VERCEL_ENV,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    matches,
  });
}
