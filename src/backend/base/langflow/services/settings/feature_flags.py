from pydantic_settings import BaseSettings


class FeatureFlags(BaseSettings):
    mvp_components: bool = False
    mcp_composer: bool = True
    search: bool = False  # Phase 2: Web search integration (Tavily + DuckDuckGo)
    docs_grounding: bool = False  # Phase 2: Langflow documentation grounding

    class Config:
        env_prefix = "LANGFLOW_FEATURE_"


FEATURE_FLAGS = FeatureFlags()
