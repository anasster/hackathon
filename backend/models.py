"""Models"""

from datetime import datetime
from typing import Dict
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID, uuid4

class GreekID(BaseModel):
    id: UUID = Field(..., alias='_id', title=None, field_title_generator=None)
    id_num: str = Field(...)
    given_name: str = Field(...)
    surname: str = Field(...)
    father_name: str = Field(...)
    mother_name: str = Field(...)
    date_of_birth: datetime = Field(...)
    place_of_birth: str = Field(...)
    issue_date: datetime = Field(...)
    issue_office: str = Field(...)
    wallet_id: str = Field(...)
    
    model_config = ConfigDict(
        populate_by_name=True,  
        json_schema_extra={"additionalProperties": False} 
    )



def generate_nilDB_schema(model: type[BaseModel]) -> dict:
    schema = model.model_json_schema(by_alias=True, mode='serialization')  # Use draft-07 compatible version
    schema["additionalProperties"] = False  # Ensure extra properties are not allowed

    for field_name, field_info in schema.get("properties", {}).items():
        field_format = field_info.get("format", "")

        # Add `coerce: true` if the field is UUID or date-time
        if field_format in {"uuid", "date-time"}:
            field_info["coerce"] = True
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",  # Explicitly declare draft-07
        "type": "array",
        "items": schema
    }


def generate_item_dict(model: type[BaseModel]):
    model_dict = model.model_dump(by_alias=True)
    for key, val in model_dict.items():
        if isinstance(val, datetime):
            model_dict[key] = val.strftime("%Y-%m-%dT%H:%M:%SZ")
        if isinstance(val, UUID):
            model_dict[key] = str(val)
    return model_dict