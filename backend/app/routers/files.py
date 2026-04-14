from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/files", tags=["Dosyalar"])

@router.get("/", response_model=List[schemas.Dosya])
def read_files(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_dosyalar(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Dosya)
def create_file(dosya: schemas.DosyaCreate, db: Session = Depends(database.get_db)):
    return crud.create_dosya(db=db, dosya=dosya)

@router.get("/{dosya_id}", response_model=schemas.Dosya)
def read_file(dosya_id: int, db: Session = Depends(database.get_db)):
    db_file = crud.get_dosya(db, dosya_id=dosya_id)
    if db_file is None:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    return db_file
