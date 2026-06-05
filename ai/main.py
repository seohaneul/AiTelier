import os
import io
import base64
import urllib.request
import re
import requests
from PIL import Image, ImageFilter
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# === 설정 ===
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="CraftAI Nano-Banana Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except: return None

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("\n[INFO] === NANO-BANANNA SYNTHESIS START ===")
    
    leather_data = get_image_data(req.leather_url)
    product_data = get_image_data(req.template_url)

    if not leather_data or not product_data:
        return {"result_image_url": req.template_url}
    
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        # 1. 원본 이미지 준비
        orig_img = Image.open(io.BytesIO(product_data)).convert("RGB")
        w, h = orig_img.size
        
        # 2. 파트 준비 (Nano-Banana는 멀티모달 합성을 지원)
        product_part = types.Part.from_bytes(data=product_data, mime_type="image/png")
        leather_part = types.Part.from_bytes(data=leather_data, mime_type="image/png")
        
        # Universal Master Artisan Synthesis Prompt (Context-Aware & Design-First)
        prompt = (
            "You are a universal master artisan and digital visualizer. "
            "Your mission is to flawlessly integrate the 'Master Design' from the FIRST image into the 'Target Scene' of the SECOND image. "
            "1. MASTER DESIGN (FIRST IMAGE): This is the definitive creation (e.g., a garment, a jewelry piece, a material, or a craft). You must preserve its exact colors, intricate textures, patterns, and craftsmanship details without any modification. "
            "2. TARGET SCENE (SECOND IMAGE): This is the real-world context (e.g., a person, a hand, a room, or a product background). Maintain all unique characteristics of this scene, including the subject's pose, anatomy, lighting, and environmental background. "
            "3. SEAMLESS INTEGRATION: Identify the most appropriate area or object in the SECOND image that should be replaced by the FIRST image's design. Replace it entirely with the master design while ensuring it conforms naturally to the shapes, curves, and perspective of the target scene. "
            "4. PURITY OF DESIGN: Do not let the original colors or textures of the target area in the SECOND image bleed into or affect the MASTER DESIGN. The design from the FIRST image must remain pure and dominant in its designated area. "
            "The final output must be a professional, high-resolution visualization that looks like an authentic, high-end photograph."
        )

        print(f"[INFO] Requesting Nano-Banana (Gemini 3 Pro)...")
        # Nano-Banana (Gemini 3 Pro) 호출
        response = client.models.generate_content(
            model="nano-banana-pro-preview",
            contents=[prompt, product_part, leather_part]
        )
        
        # 결과 처리
        # Nano-Banana는 response.candidates[0].content.parts[0].inline_data.data에 이미지 바이너리를 담아줍니다.
        if response.candidates and response.candidates[0].content.parts:
            img_part = response.candidates[0].content.parts[0]
            if hasattr(img_part, 'inline_data'):
                final_image_data = img_part.inline_data.data
                b64_res = base64.b64encode(final_image_data).decode('utf-8')
                print(f"[SUCCESS] Nano-Banana Synthesis Complete!")
                return {"result_image_url": f"data:image/png;base64,{b64_res}"}
        
        print("[ERROR] Nano-Banana failed to return image data.")
        return {"result_image_url": req.template_url}
        
    except Exception as e:
        print(f"[ERROR] Nano-Banana Synthesis failed: {e}")
        return {"result_image_url": req.template_url}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    print(f"[INFO] Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
