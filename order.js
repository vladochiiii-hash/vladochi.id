const EMAIL_TO = "vladochiiii@gmail.com";
const ALLOWED_SAUCE = new Set(["Coklat", "Matcha"]);
const ALLOWED_CRUNCH = new Set(["Tidak ada", "Oreo", "Coco Crunch", "Wafer", "Strawberry", "Taro", "Vanila"]);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Metode tidak diizinkan." }) };
  try {
    const data = JSON.parse(event.body || "{}");
    const customer = String(data.customer || "").trim().slice(0, 120);
    const phone = String(data.phone || "").trim().slice(0, 40);
    const delivery = String(data.delivery || "");
    const address = String(data.address || "").trim().slice(0, 500);
    const notes = String(data.notes || "").trim().slice(0, 1000);
    const orderId = String(data.orderId || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
    const items = data.items;
    if (!customer || !orderId || !Array.isArray(items) || items.length < 1 || items.length > 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Data pesanan belum lengkap." }) };
    }
    if (!["Ambil sendiri", "Diantar"].includes(delivery) || (delivery === "Diantar" && !address)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Periksa metode pengambilan dan alamat." }) };
    }
    let total = 0;
    const cleanItems = [];
    for (const item of items) {
      const qty = Number(item.qty);
      const sauce = String(item.sauce || "");
      const crunch = String(item.crunch || "");
      const base = String(item.base || "Isian coklat");
      if (!Number.isInteger(qty) || qty < 1 || qty > 99 || !ALLOWED_SAUCE.has(sauce) || !ALLOWED_CRUNCH.has(crunch) || base !== "Isian coklat") {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Pilihan menu tidak valid. Muat ulang halaman dan coba lagi." }) };
      }
      const unit = 8000 + 3000 + (crunch !== "Tidak ada" ? 3000 : 0);
      total += unit * qty;
      cleanItems.push({ qty, sauce, crunch, base, unit, subtotal: unit * qty });
    }
    if (total > 100000000) return { statusCode: 400, headers, body: JSON.stringify({ error: "Total pesanan tidak valid." }) };
    const money = n => "Rp" + n.toLocaleString("id-ID");
    const itemRows = cleanItems.map((x, i) => `<tr><td>${i+1}</td><td>${x.qty} × Donat Mochi</td><td>Isian: ${escapeHtml(x.base)}<br>Topping cair: ${escapeHtml(x.sauce)}<br>Crunch: ${escapeHtml(x.crunch)}</td><td>${money(x.subtotal)}</td></tr>`).join("");
    const textItems = cleanItems.map((x, i) => `${i+1}. ${x.qty}x Donat Mochi | Isian ${x.base} | Topping cair ${x.sauce} | Crunch ${x.crunch} | ${money(x.subtotal)}`).join("\n");
    const text = `PESANAN VLA DOCHI\nNomor: ${orderId}\nNama: ${customer}\nWhatsApp: ${phone || "-"}\nMetode: ${delivery}\n${delivery === "Diantar" ? `Alamat: ${address}\n` : ""}\n${textItems}\n\nCatatan: ${notes || "-"}\nTOTAL: ${money(total)}\nStatus: MENUNGGU KONFIRMASI TOKO`;
    const html = `<div style="font-family:Arial,sans-serif;color:#35251e"><h2>Pesanan baru VLA DOCHI</h2><p><b>Nomor pesanan:</b> ${escapeHtml(orderId)}</p><p><b>Nama:</b> ${escapeHtml(customer)}<br><b>WhatsApp:</b> ${escapeHtml(phone || "-")}<br><b>Metode:</b> ${escapeHtml(delivery)}${delivery === "Diantar" ? `<br><b>Alamat:</b> ${escapeHtml(address)}` : ""}</p><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#ddd"><thead><tr><th>#</th><th>Menu</th><th>Pilihan</th><th>Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table><h3>Total: ${money(total)}</h3><p><b>Catatan:</b> ${escapeHtml(notes || "-")}</p><p>Status: MENUNGGU KONFIRMASI TOKO</p></div>`;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return { statusCode: 500, headers, body: JSON.stringify({ error: "Email toko belum dikonfigurasi oleh admin. Silakan coba lagi nanti." }) };
    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [EMAIL_TO], subject: `Pesanan VLA DOCHI ${orderId}`, html, text })
    });
    if (!mail.ok) {
      const details = await mail.text();
      console.error("Resend error", mail.status, details.slice(0, 1000));
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Email belum berhasil dikirim. Coba lagi atau hubungi toko melalui WhatsApp." }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, orderId }) };
  } catch (error) {
    console.error("Order function error", error);
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Permintaan pesanan tidak terbaca. Periksa isian dan coba lagi." }) };
  }
};
