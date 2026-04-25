#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIBRARY_ROOT="$ROOT/data/library"

mkdir -p \
  "$LIBRARY_ROOT/manuals" \
  "$LIBRARY_ROOT/medical" \
  "$LIBRARY_ROOT/water" \
  "$LIBRARY_ROOT/sanitation" \
  "$LIBRARY_ROOT/maps/reference/state_county_outlines"

download() {
  local url="$1"
  local output="$2"
  if [ -f "$output" ]; then
    echo "Skipping existing: $output"
    return
  fi
  echo "Downloading: $output"
  if ! curl -L --fail -o "$output" "$url"; then
    echo "Download failed: $url"
    rm -f "$output"
  fi
}

download "https://hesperian.org/wp-content/uploads/pdf/en_wtnd_2020/en_wtnd_2020_fm.pdf" \
  "$LIBRARY_ROOT/medical/where-there-is-no-doctor-2020.pdf"

download "https://hesperian.org/wp-content/uploads/pdf/en_dent_2023/en_dent_2023_fm.pdf" \
  "$LIBRARY_ROOT/medical/where-there-is-no-dentist-2023.pdf"

download "https://commons.wikimedia.org/wiki/Special:FilePath/FM%203-05.70%20(FM%2021-76)%20Survival%20-%20May%202002.pdf" \
  "$LIBRARY_ROOT/manuals/fm-3-05-70-survival-manual.pdf"

download "https://www.twdb.texas.gov/publications/brochures/conservation/doc/RainwaterHarvestingManual_3rdedition.pdf" \
  "$LIBRARY_ROOT/water/texas-manual-on-rainwater-harvesting.pdf"

download "https://www.tceq.texas.gov/downloads/p2/publications/rg-445.pdf" \
  "$LIBRARY_ROOT/water/tceq-rainwater-harvesting-guide-public-water-systems.pdf"

download "https://stacks.cdc.gov/view/cdc/41652/cdc_41652_DS1.pdf" \
  "$LIBRARY_ROOT/water/cdc-how-to-make-water-safe-with-household-bleach.pdf"

download "https://stacks.cdc.gov/view/cdc/79547/cdc_79547_DS1.pdf" \
  "$LIBRARY_ROOT/water/cdc-household-water-treatment-safe-water-storage.pdf"

download "https://www.epa.gov/sites/production/files/2015-06/documents/comp.pdf" \
  "$LIBRARY_ROOT/sanitation/epa-composting-toilets-fact-sheet.pdf"

download "https://www.fao.org/3/i4021e/i4021e.pdf" \
  "$LIBRARY_ROOT/farming/fao-small-scale-aquaponic-food-production.pdf"

download "https://seedalliance.org/wp-content/uploads/2010/04/seed_saving_guide.pdf" \
  "$LIBRARY_ROOT/farming/organic-seed-alliance-seed-saving-guide.pdf"

STATE_CODES=(
  AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD
  MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC
  SD TN TX UT VT VA WA WV WI WY
)

STATE_NAMES=(
  alabama alaska arizona arkansas california colorado connecticut delaware florida georgia
  hawaii idaho illinois indiana iowa kansas kentucky louisiana maine maryland
  massachusetts michigan minnesota mississippi missouri montana nebraska nevada new-hampshire new-jersey
  new-mexico new-york north-carolina north-dakota ohio oklahoma oregon pennsylvania rhode-island south-carolina
  south-dakota tennessee texas utah vermont virginia washington west-virginia wisconsin wyoming
)

for i in "${!STATE_CODES[@]}"; do
  code="${STATE_CODES[$i]}"
  name="${STATE_NAMES[$i]}"
  download \
    "https://www2.census.gov/geo/maps/general_ref/stco_outline/cen90_pgsz/stco_90_${code}.pdf" \
    "$LIBRARY_ROOT/maps/reference/state_county_outlines/${name}-county-outline-map.pdf"
done

download \
  "https://www2.census.gov/geo/maps/general_ref/stco_outline/cen90_pgsz/stco_90.pdf" \
  "$LIBRARY_ROOT/maps/reference/united-states-county-outline-map.pdf"

echo "Offline library load complete."
