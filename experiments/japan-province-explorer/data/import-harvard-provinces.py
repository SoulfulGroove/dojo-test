#!/usr/bin/env python3
"""Import Harvard Tokugawa GIS kuni polygons from CC0 Dataverse archive.

Source: Lex Berman, 2017, Japan Tokugawa GIS, V1, doi:10.7910/DVN/2CVTR0.
The province layer uses a much later (approximately 1828) reference; it is
NOT a verified reconstruction of provincial boundaries in 1580–1650.
"""
from pathlib import Path
from io import BytesIO
import json, re, zipfile, tempfile
import requests
import geopandas as gpd
from shapely.geometry import mapping

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "harvard-kuni.geojson"
INFO = ROOT / "harvard-kuni-metadata.json"
DOI = "doi:10.7910/DVN/2CVTR0"
URL = "https://dataverse.harvard.edu/api/access/dataset/:persistentId/"

response = requests.get(URL, params={"persistentId": DOI}, timeout=120)
response.raise_for_status()
if not zipfile.is_zipfile(BytesIO(response.content)):
    raise RuntimeError(f"Dataverse returned non-ZIP ({response.headers.get('Content-Type')}); first bytes: {response.content[:150]!r}")
with tempfile.TemporaryDirectory() as temp:
    target = Path(temp)
    with zipfile.ZipFile(BytesIO(response.content)) as z:
        paths = [i.filename for i in z.infolist() if not i.is_dir()]
        archives = [p for p in paths if "jp_toku_kuni_pgn" in p.lower() and p.lower().endswith(".zip")]
        if archives:
            archive_data = z.read(archives[0])
            with zipfile.ZipFile(BytesIO(archive_data)) as s:
                s.extractall(target)
        else:
            z.extractall(target)
    shp_paths = list(target.rglob("*.shp")) + list(target.rglob("*.SHP"))
    shp_paths = [p for p in shp_paths if "kuni" in p.name.lower()] or shp_paths
    if not shp_paths:
        raise RuntimeError("No shapefile found in Dataverse archive; " + str(paths))
    source = sorted(shp_paths, key=lambda p:len(str(p)))[0]
    gdf = gpd.read_file(source)
    if gdf.empty: raise RuntimeError("No province features were read")
    if gdf.crs is None:
        raise RuntimeError("Source shapefile has no known CRS, cannot align to modern geography safely")
    gdf = gdf.to_crs("EPSG:4326")
    fields = [c for c in gdf.columns if c != "geometry"]
    features = []
    for n, row in gdf.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty: continue
        geom = geom.simplify(0.0004, preserve_topology=True)
        props = {}
        for k in fields:
            v = row[k]
            if v is None: continue
            try:
                if v != v: continue
            except Exception: pass
            if hasattr(v, "item"): v=v.item()
            if isinstance(v, (str,float,int,bool)): props[k] = v
        def label():
            candidates = sorted((k for k in props if re.search(r"romaji|roman|name|kuni|eng|label",k,re.I)), key=lambda k:0 if re.search(r"romaji|roman|name",k,re.I) else 1)
            for k in candidates:
                v=str(props[k]).strip()
                if 2 <= len(v) <= 65 and any(c.isalpha() for c in v): return v
            return "Province " + str(len(features)+1)
        props["display_name"] = label()
        props["historical_source"] = "Harvard Tokugawa Japan GIS, province layer based on late-Edo/1828 reference"
        props["source_doi"] = DOI
        features.append({"type":"Feature","id":"harvard-kuni-"+str(len(features)+1).zfill(3),"properties":props,"geometry":mapping(geom)})
    if len(features)<30:
        raise RuntimeError(f"Unexpectedly few polygons ({len(features)}); inspect the source")
    geo={"type":"FeatureCollection","name":"Harvard Tokugawa Provinces, approximate 1828 reference","features":features}
    OUT.write_text(json.dumps(geo,ensure_ascii=False,separators=(",",":"),allow_nan=False)+"\n",encoding="utf-8")
    INFO.write_text(json.dumps({
      "dataset":"Japan Tokugawa GIS - Kuni polygons",
      "citation":"Berman, Lex, 2017, Japan Tokugawa GIS, Harvard Dataverse, V1",
      "doi":DOI,
      "license":"CC0 1.0",
      "historical_reference":"late Edo / approximately 1828, not 1580-1650",
      "caveats":["Provisional province lines", "Modern coastlines may not coincide", "No daimyo boundaries", "Does not depict Ezo/Ryukyu as Japanese kuni"],
      "source_shapefile":source.name,
      "source_fields":fields,
      "feature_count":len(features),
      "feature_samples":[f["properties"] for f in features[:3]],
      "crs":"EPSG:4326",
      "web_simplification_degrees":0.0004
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Saved {OUT} with {len(features)} features; {OUT.stat().st_size} bytes; properties {fields}")
