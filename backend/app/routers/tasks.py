from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import crud, schemas, database, models

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.AktifGorev)
def create_task(gorev: schemas.AktifGorevCreate, db: Session = Depends(database.get_db)):
    return crud.create_gorev(db=db, gorev=gorev)

@router.get("/user/{user_id}", response_model=List[schemas.AktifGorev])
def read_personal_tasks(user_id: int, db: Session = Depends(database.get_db)):
    return crud.get_gorevler_by_kullanici(db, user_id)

@router.get("/unit/{birim_id}", response_model=List[schemas.AktifGorev])
def read_unit_tasks(birim_id: int, db: Session = Depends(database.get_db)):
    return crud.get_gorevler_by_birim(db, birim_id)

@router.post("/transfer")
def transfer_task(gorev_id: int, yeni_atanan_id: int, yapan_id: int, db: Session = Depends(database.get_db)):
    return crud.transfer_gorev(db, gorev_id, yeni_atanan_id, yapan_id)

@router.patch("/{gorev_id}", response_model=schemas.AktifGorev)
def update_task_status(gorev_id: int, durum: str, db: Session = Depends(database.get_db)):
    return crud.update_gorev_durum(db, gorev_id, durum)

@router.patch("/{gorev_id}/edit")
def edit_task(gorev_id: int, notlar: Optional[str] = None, vade_tarihi: Optional[date] = None, db: Session = Depends(database.get_db)):
    db_gorev = db.query(models.AktifGorev).filter(models.AktifGorev.id == gorev_id).first()
    if not db_gorev:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    if notlar is not None:
        db_gorev.notlar = notlar
    if vade_tarihi is not None:
        db_gorev.vade_tarihi = vade_tarihi
    db.commit()
    db.refresh(db_gorev)
    return db_gorev

@router.delete("/{gorev_id}")
def delete_task(gorev_id: int, db: Session = Depends(database.get_db)):
    return crud.delete_gorev(db, gorev_id)
