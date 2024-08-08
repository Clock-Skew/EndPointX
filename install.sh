#!/bin/bash

# Check if Java is installed
if ! java -version &>/dev/null; then
  echo "Java is not installed. Please install Java and run this script again."
  exit 1
fi

# Install dependencies
sudo apt update
sudo apt install -y wget unzip git

# Install jadx
JADX_VERSION="1.3.1"
JADX_URL="https://github.com/skylot/jadx/releases/download/v${JADX_VERSION}/jadx-${JADX_VERSION}.zip"
wget $JADX_URL -O /tmp/jadx.zip
sudo unzip /tmp/jadx.zip -d /opt/jadx || { echo "Failed to unzip jadx"; exit 1; }
sudo ln -sf /opt/jadx/bin/jadx /usr/bin/jadx
sudo ln -sf /opt/jadx/bin/jadx-gui /usr/bin/jadx-gui
echo "Installed jadx version ${JADX_VERSION} from ${JADX_URL}"

# Install apktool
APKTOOL_VERSION="2.5.0"
APKTOOL_URL="https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_${APKTOOL_VERSION}.jar"
wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool -O /tmp/apktool
wget $APKTOOL_URL -O /tmp/apktool.jar
sudo mv /tmp/apktool /usr/local/bin/apktool
sudo mv /tmp/apktool.jar /usr/local/bin/apktool.jar
sudo chmod +x /usr/local/bin/apktool
echo -e "#!/bin/bash\njava -jar /usr/local/bin/apktool.jar \"\$@\"" | sudo tee /usr/local/bin/apktool
sudo chmod +x /usr/local/bin/apktool
echo "Installed apktool version ${APKTOOL_VERSION} from ${APKTOOL_URL}"

# Install dex2jar
DEX2JAR_VERSION="2.1"
DEX2JAR_URL="https://github.com/pxb1988/dex2jar/releases/download/2.1/dex-tools-2.1.zip"
wget $DEX2JAR_URL -O /tmp/dex2jar.zip
sudo unzip /tmp/dex2jar.zip -d /opt/dex2jar || { echo "Failed to unzip dex2jar"; exit 1; }
sudo ln -sf /opt/dex2jar/d2j-dex2jar.sh /usr/bin/dex2jar
echo "Installed dex2jar version ${DEX2JAR_VERSION} from ${DEX2JAR_URL}"

# Install baksmali
git clone https://github.com/JesusFreke/smali.git /tmp/smali
cd /tmp/smali
./gradlew build
sudo mv /tmp/smali/baksmali/build/libs/baksmali-2.5.2.jar /usr/local/bin/baksmali.jar
echo -e "#!/bin/bash\njava -jar /usr/local/bin/baksmali.jar \"\$@\"" | sudo tee /usr/local/bin/baksmali
sudo chmod +x /usr/local/bin/baksmali
echo "Installed baksmali from https://github.com/JesusFreke/smali"

echo "Installation complete. You can now use jadx, apktool, dex2jar, and baksmali."
