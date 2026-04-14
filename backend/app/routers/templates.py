from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/templates", tags=["Şablonlar"])

@router.get("/", response_model=List[schemas.SenaryoSablonu])
def read_templates(db: Session = Depends(database.get_db)):
    return crud.get_sablonlar(db)
