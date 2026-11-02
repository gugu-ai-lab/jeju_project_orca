export default function handler(req, res) {
  res.status(200).json({ ok: true, time: new Date().toISOString(),
    hasDataKey: Boolean(process.env.DATA_GO_KR_KEY?.trim()), hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
  })
}
