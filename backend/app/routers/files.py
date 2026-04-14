from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database, models

router = APIRouter(prefix="/files", tags=["files"])

@router.get("/", response_model=List[schemas.Dosya])
def read_files(birim_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    if birim_id:
        return crud.get_dosyalar_by_birim(db, birim_id)
    return []

@router.post("/", response_model=schemas.Dosya)
def create_file(dosya: schemas.DosyaCreate, db: Session = Depends(database.get_db)):
    # Aynı yıl+esas_no+birim kombinasyonu var mı kontrol et
    existing = db.query(models.Dosya).filter(
        models.Dosya.yil == dosya.yil,
        models.Dosya.esas_no == dosya.esas_no,
        models.Dosya.birim_id == dosya.birim_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail={
                "message": f"{dosya.yil}/{dosya.esas_no} esas numarası bu birimde zaten kayıtlı.",
                "existing_id": existing.id,
                "existing_no": f"{existing.yil}/{existing.esas_no}"
            }
        )
    return crud.create_dosya(db=db, dosya=dosya)

@router.put("/{dosya_id}", response_model=schemas.Dosya)
def update_file(dosya_id: int, data: dict, db: Session = Depends(database.get_db)):
    return crud.update_dosya(db, dosya_id, data)

@router.get("/{dosya_id}", response_model=schemas.Dosya)
def read_file(dosya_id: int, db: Session = Depends(database.get_db)):
    db_file = crud.get_dosya(db, dosya_id=dosya_id)
    if db_file is None:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    return db_file

@router.delete("/{dosya_id}")
def delete_file_direct(dosya_id: int, db: Session = Depends(database.get_db)):
    """Müdür doğrudan dosya silme."""
    db_file = db.query(models.Dosya).filter(models.Dosya.id == dosya_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    db.delete(db_file)
    db.commit()
    return {"ok": True}

# --- SİLME TALEPLERİ ---
@router.post("/delete-request")
def request_delete(request: schemas.DosyaSilmeTalebiBase, db: Session = Depends(database.get_db)):
    return crud.create_silme_talebi(db, dosya_id=request.dosya_id, talep_eden_id=request.talep_eden_id, neden=request.neden)

@router.get("/delete-requests/{birim_id}")
def list_delete_requests(birim_id: int, db: Session = Depends(database.get_db)):
    return crud.get_silme_talepleri_by_birim(db, birim_id)

@router.post("/approve-delete/{talep_id}")
def approve_delete(talep_id: int, onaylayan_id: int, db: Session = Depends(database.get_db)):
    return crud.approve_silme_talebi(db, talep_id, onaylayan_id)

@router.post("/reject-delete/{talep_id}")
def reject_delete(talep_id: int, db: Session = Depends(database.get_db)):
    talep = db.query(models.DosyaSilmeTalebi).filter(models.DosyaSilmeTalebi.id == talep_id).first()
    if talep:
        talep.durum = "Reddedildi"
        db.commit()
    return {"ok": True}
