# Japan · Historical Province Explorer (Prototype 1)

**Live page:** https://soulfulgroove.github.io/dojo-test/experiments/japan-province-explorer/

This is a first, simple, interactive historical province (*kuni*) overlay positioned on a modern Japanese geographical base. It is **not** a 1600 map and does not display daimyo domains. Use it to learn the locations, relative shapes and names of the historical provinces while beginning source-by-source boundary verification.

## What is implemented

- Current coordinates and map tiles from Japan's Geospatial Information Authority (GSI), with clean outline, elevation and pale-reference base options.
- [Harvard Japan Tokugawa GIS province polygons](https://doi.org/10.7910/DVN/2CVTR0), imported and converted to web GeoJSON at `data/harvard-kuni.geojson` (69 polygon features in this release).
- Controls to toggle province boundaries and labels, adjust opacity, fit the map and download the loaded GeoJSON.
- Click a province to inspect its name and source attributes.

## Historical caveats

The Harvard GIS dataset (Lex Berman, 2017, Harvard Dataverse, CC0 1.0) approximates `kuni` province boundaries on the basis of late-Edo reference geography, broadly associated with a **c. 1828** map. It is not a dated source for any exact provincial border in 1580, 1600, 1615 or 1645. Modern coastlines differ from those in the period; the map should not be used to assert local historical ownership or precise regional resource availability. Ezo/Ainu territories and Ryukyu are distinct historical geographical and political systems not captured by this mainland province layer.

The *kuni* provinces are also **not** daimyo domains (*han*) and must never be conflated with them. Several regions and island groups are not included in Harvard's 69-province layer.

## Sources and provenance

- Harvard Dataverse: **Berman, Lex (2017), Japan Tokugawa GIS, V1**, DOI [10.7910/DVN/2CVTR0](https://doi.org/10.7910/DVN/2CVTR0); downloadable `jp_toku_kuni_pgn.ZIP`; license CC0 1.0.
- Harvard historical project: [Japan Historical GIS](https://chgis.fas.harvard.edu/data/japan/).
- Modern mapping authority: [GSI Maps](https://maps.gsi.go.jp/) and [GSI tile catalogue](https://maps.gsi.go.jp/development/ichiran.html). Relief uses marine data from Japan Coast Guard as required by GSI attribution.
- Fallback if the checked-in Harvard GeoJSON cannot load: [ArcGIS JapanHistoricMap Tokugawa Provinces](https://services5.arcgis.com/cuQhNeNcUrgLmYGD/ArcGIS/rest/services/JapanHistoricMap/FeatureServer/1). The fallback has less-established provenance and is identified explicitly in the viewer. The Harvard file is the intended main source.

## How it was built

`data/import-harvard-provinces.py` downloads the original Dataverse archive, chooses the *kuni* polygon shapefile, transforms to WGS84/EPSG:4326, fixes detected Japanese-label character encoding, simplifies the shapes slightly for web display and exports GeoJSON plus metadata. The repository workflow `.github/workflows/build-japan-kuni-geojson.yml` automatically regenerates and commits those files when the importer changes.

The page is intentionally independent of the existing [historical Japan atlas](../japan-historical-atlas/) and [modern island-outline experiment](../japan-base-map/). No original experiment code was overwritten.

## Next quality improvement

Validate the province names and outlines against selected 1644–1648 Shōhō provincial maps, marking verified changes and unknown sections. Do not silently transfer these late-Edo boundaries to 1600.
