#!/bin/bash

# Function to display banner
show_banner() {
  echo "=============================================================================>>>"
  echo "                                                                                         
@@@@@@@@  @@@  @@@  @@@@@@@   @@@@@@@    @@@@@@   @@@  @@@  @@@  @@@@@@@  @@@  @@@  
@@@@@@@@  @@@@ @@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@  @@@@ @@@  @@@@@@@  @@@  @@@  
@@!       @@!@!@@@  @@!  @@@  @@!  @@@  @@!  @@@  @@!  @@!@!@@@    @@!    @@!  !@@  
!@!       !@!!@!@!  !@!  @!@  !@!  @!@  !@!  @!@  !@!  !@!!@!@!    !@!    !@!  @!!  
@!!!:!    @!@ !!@!  @!@  !@!  @!@@!@!   @!@  !@!  !!@  @!@ !!@!     @!------!@@!@=============>>>  
!!!!!:    !@!  !!!  !@!  !!!  !!@!!!    !@!  !!!  !!!  !@!  !!!    !!!      @!!!==========>> 
!!:       !!:  !!!  !!:  !!!  !!:       !!:  !!!  !!:  !!:  !!!    !!:     !: :!!   
:!:       :!:  !:!  :!:  !:!  :!:       :!:  !:!  :!:  :!:  !:!    :!:    :!:  !:!  
 :: ::::   ::   ::   :::: ::   ::       ::::: ::   ::   ::   ::     ::     ::  :::"                                                                                                                                         
  echo "==================================================================================>>>"
    echo "============================================================================>>"
  
}

# Ensure the script is run as root
if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root"
  exit 1
fi

# Function to decompile using jadx
decompile_jadx() {
  if ! command -v jadx &> /dev/null; then
    echo "jadx could not be found"
    exit 1
  fi
  jadx -d "$OUTPUT_DIR" "$APK_FILE" || { echo "jadx decompilation failed"; move_jobf; exit 1; }
}

# Function to decompile using apktool
decompile_apktool() {
  if ! command -v apktool &> /dev/null; then
    echo "apktool could not be found"
    exit 1
  fi
  timeout 300 apktool d -f -o "$OUTPUT_DIR" "$APK_FILE" || { echo "apktool decompilation failed"; move_jobf; exit 1; }
}

# Function to decompile using dex2jar
decompile_dex2jar() {
  DEX2JAR_CMD=$(command -v d2j-dex2jar)
  if [ -z "$DEX2JAR_CMD" ]; then
    echo "dex2jar could not be found"
    exit 1
  fi

  mkdir -p "$OUTPUT_DIR/classes"
  $DEX2JAR_CMD --force -o "$OUTPUT_DIR/classes-dex2jar.jar" "$APK_FILE" || { echo "dex2jar conversion failed"; move_jobf; exit 1; }
  unzip -o "$OUTPUT_DIR/classes-dex2jar.jar" -d "$OUTPUT_DIR/classes" || { echo "unzip failed"; move_jobf; exit 1; }
}

# Function to decompile using all methods
decompile_all() {
  decompile_jadx
  decompile_apktool
  decompile_dex2jar
}

# Function to search for endpoints
search_endpoints() {
  mkdir -p output
  OUTPUT_FILE="output/endpoints.txt"
  ENDPOINTS_ONLY_FILE="output/endpoints_only.txt"
  JSON_FILE="output/endpoints.json"
  
  grep -rEo 'http[s]?://[^"]+|www\.[^"]+|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b' "$OUTPUT_DIR" > "$OUTPUT_FILE"
  sort -u "$OUTPUT_FILE" -o "$OUTPUT_FILE"
  grep -rEo 'http[s]?://[^"]+|www\.[^"]+|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b' "$OUTPUT_FILE" > "$ENDPOINTS_ONLY_FILE"
  sort -u "$ENDPOINTS_ONLY_FILE" -o "$ENDPOINTS_ONLY_FILE"
  jq -R -s -c 'split("\n") | map(select(length > 0))' "$OUTPUT_FILE" > "$JSON_FILE"
  echo "Endpoints have been extracted to $OUTPUT_FILE, $ENDPOINTS_ONLY_FILE, and $JSON_FILE"
}

# Function to move jobf file to output directory
move_jobf() {
  JOBF_FILE=$(find $APK_DIR -type f -name "*.jobf")
  if [[ -n $JOBF_FILE ]]; then
    mv "$JOBF_FILE" output/
    echo "Moved $JOBF_FILE to output directory"
  fi
}

# Function to cleanup
cleanup() {
  rm -rf "$OUTPUT_DIR"
  echo "Cleaned up $OUTPUT_DIR"
}

# Function to display menu
show_menu() {
  echo "Choose decompilation method:"
  echo "1. jadx"
  echo "2. apktool"
  echo "3. dex2jar"
  echo "4. All methods"
  echo "5. Bulk decompile all APKs"
  echo "6. List APKs and select one"
  read -p "Enter choice [1-6]: " choice
}

# Function to list APKs and select one
select_apk() {
  APK_FILES=($APK_DIR/*.apk)
  echo "Available APKs:"
  for i in "${!APK_FILES[@]}"; do
    echo "$((i+1)). ${APK_FILES[$i]}"
  done
  read -p "Select APK by number: " apk_choice
  APK_FILE=${APK_FILES[$((apk_choice-1))]}
}

# Main script execution
show_banner

APK_DIR="apk"
DEFAULT_APK_FILE=$(find $APK_DIR -type f -name "*.apk" | head -n 1)

if [[ -z $DEFAULT_APK_FILE ]]; then
  echo "No APK files found in the 'apk' directory."
  exit 1
fi

show_menu

if [[ $choice -eq 6 ]]; then
  select_apk
  OUTPUT_DIR=$(basename "$APK_FILE" .apk)_decompiled
  show_menu
else
  APK_FILE=$DEFAULT_APK_FILE
  OUTPUT_DIR=$(basename "$APK_FILE" .apk)_decompiled
fi

case $choice in
  1) decompile_jadx; search_endpoints; move_jobf; cleanup ;;
  2) decompile_apktool; search_endpoints; move_jobf; cleanup ;;
  3) decompile_dex2jar; search_endpoints; move_jobf; cleanup ;;
  4) decompile_all; search_endpoints; move_jobf; cleanup ;;
  5) for apk in $APK_DIR/*.apk; do
       APK_FILE=$apk; OUTPUT_DIR=$(basename "$APK_FILE" .apk)_decompiled; decompile_all; search_endpoints; move_jobf; cleanup;
     done ;;
  *) echo "Invalid choice" ; exit 1 ;;
esac
