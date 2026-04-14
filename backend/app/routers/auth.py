from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.Kullanici)
def register(kullanici: schemas.KullaniciCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_kullanici_by_sicil(db, sicil_no=kullanici.sicil_no)
    if db_user:
        raise HTTPException(status_code=400, detail="Sicil no zaten kayıtlı")
    return crud.create_kullanici(db=db, kullanici=kullanici)

@router.post("/login")
def login(sicil_no: str, sifre: str, db: Session = Depends(database.get_db)):
    user = crud.get_kullanici_by_sicil(db, sicil_no=sicil_no)
    if not user or user.sifre != sifre:
        raise HTTPException(status_code=401, detail="Hatalı sicil no veya şifre")
    return {"status": "success", "user": user}
