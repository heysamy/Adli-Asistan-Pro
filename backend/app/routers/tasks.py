from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/tasks", tags=["Görevler"])

@router.post("/", response_model=schemas.AktifGorev)
def create_task(gorev: schemas.AktifGorevCreate, db: Session = Depends(database.get_db)):
    return crud.create_gorev(db=db, gorev=gorev)

@router.get("/file/{dosya_id}", response_model=List[schemas.AktifGorev])
def read_tasks_by_file(dosya_id: int, db: Session = Depends(database.get_db)):
    return crud.get_gorevler_by_dosya(db, dosya_id=dosya_id)

@router.patch("/{gorev_id}", response_model=schemas.AktifGorev)
def update_task_status(gorev_id: int, durum: str, db: Session = Depends(database.get_db)):
    db_task = crud.update_gorev_durum(db, gorev_id=gorev_id, durum=durum)
    if not db_task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    return db_task
