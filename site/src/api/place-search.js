export default async function handler(req, res) {
  const q = (req.query.q || "").toString().slice(0, 120);
  if (q.length < 3) return res.status(400).json({ ok: false });
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY,
        "Referer": "https://wellearnedreviews.com/",
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery: q, maxResultCount: 5 }),
    });
    const d = await r.json();
    if (!d.places) return res.status(200).json({ ok: false });
    return res.status(200).json({
      ok: true,
      places: d.places.map((p) => ({
        id: p.id,
        name: p.displayName && p.displayName.text,
        address: p.formattedAddress,
        rating: p.rating,
        count: p.userRatingCount,
      })),
    });
  } catch (e) {
    return res.status(200).json({ ok: false });
  }
}
