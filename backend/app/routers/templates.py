from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("/", response_model=List[schemas.SenaryoSablonu])
def read_templates(db: Session = Depends(database.get_db)):
    return crud.get_sablonlar(db)

@router.post("/", response_model=schemas.SenaryoSablonu)
def create_template(sablon: schemas.SenaryoSablonuCreate, db: Session = Depends(database.get_db)):
    return crud.create_sablon(db, sablon)

@router.put("/{sablon_id}", response_model=schemas.SenaryoSablonu)
def update_template(sablon_id: int, data: dict, db: Session = Depends(database.get_db)):
    return crud.update_sablon(db, sablon_id, data)

@router.delete("/{sablon_id}")
def delete_template(sablon_id: int, db: Session = Depends(database.get_db)):
    return crud.delete_sablon(db, sablon_id)
