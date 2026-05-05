import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.master.models import Produk
from app.modules.settings.models import Setting

async def send_telegram_notification(db: AsyncSession):
    # Ambil token dan chat_id dari settings
    token_result = await db.execute(select(Setting).where(Setting.key == "bot_token"))
    chat_id_result = await db.execute(select(Setting).where(Setting.key == "chat_id"))
    token_row = token_result.scalar_one_or_none()
    chat_id_row = chat_id_result.scalar_one_or_none()

    if not token_row or not token_row.value or not chat_id_row or not chat_id_row.value:
        print("Telegram bot not configured")
        return

    bot_token = token_row.value
    chat_id = chat_id_row.value

    # Cek stok kritis
    result = await db.execute(
        select(Produk).where(Produk.is_active == True, Produk.stok <= Produk.stok_minimum)
    )
    produk_list = result.scalars().all()

    if not produk_list:
        return

    # Buat pesan
    lines = ["🚨 *STOK KRITIS - SINARSTEEL* 🚨", ""]
    for p in produk_list:
        lines.append(f"• {p.nama} ({p.sku}) - Stok: {p.stok} (Min: {p.stok_minimum})")

    message = "\n".join(lines)

    # Kirim via Telegram API
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }, timeout=10)
            print("Telegram notification sent")
        except Exception as e:
            print(f"Failed to send Telegram notification: {e}")