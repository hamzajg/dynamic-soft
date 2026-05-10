from pydantic import BaseModel
from typing import Optional
from typing import List


class ServiceConfig(BaseModel):
    name: str
    path: str
    type: str
    setup: str = ""
    start: str = ""
    port: int = 0


class RepoConfig(BaseModel):
    url: str
    type: str = "monolith"
    services: List[ServiceConfig] = []


class SuiteConfig(BaseModel):
    name: str
    description: str = ""
    mode: str = "default"
    repos: List[RepoConfig] = []
    scenarios: List[str] = []
