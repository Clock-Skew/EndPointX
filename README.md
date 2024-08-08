# ~~EndPointX~~
![Static Badge](https://img.shields.io/badge/EndPoint-X-green?style=for-the-badge&color=green) ![Static Badge](https://img.shields.io/badge/Shell-green?style=for-the-badge&color=green) ![Static Badge](https://img.shields.io/badge/osint-blue?style=for-the-badge&color=blue) ![Static Badge](https://img.shields.io/badge/reverse-engineering%20-orange?style=for-the-badge&color=6f00ff) ![Static Badge](https://img.shields.io/badge/Android%20-orange?style=for-the-badge&color=00aaff) ![Static Badge](https://img.shields.io/badge/Recon-yellow?style=for-the-badge) ![Static Badge](https://img.shields.io/badge/Automation-%23005900?style=for-the-badge)


------------

**Built for Debian | Tested on Kali 24.2 | 6.8.11**

------------

[![](https://1.4142135.xyz/a.png)](https://1.4142135.xyz/a.png)

~~EndpointX~~  is a tool designed to automate the process of decompiling APKs and extracting endpoints such as **URLs**, **URIs**, **IP addresses**, **Binders**, and more. This tool helps with **analyzing the attack surface** of APK files by **identifying potential footholds via endpoints.** 

Inspired by | **[n0mi1k/apk2url](https://github.com/n0mi1k/apk2url "n0mi1k/apk2url")**

## Description

Endpoint security is essential for protecting applications against malicious activities. ~~EndPointX~~ is an open-source tool that enhances endpoint security by automating the decompilation of APK files and extracting critical endpoints. By utilizing this tool, developers and security analysts can gain insights into the core communication patterns **([IPC](https://source.android.com/docs/core/architecture/hidl/binder-ipc "IPC"))** of applications. This tool can be used for recon and reverse engeneering scenarios on android system applications as well. Particularly useful for bug hunting & testing [the Android Framework API](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/hunting-for-android-privilege-escalation-with-a-32-line-fuzzer/ "the Android Framework API"). Binder related attacks are often critical when found in the wild. 

**REF:**

[CVE-2023-20938](https://nvd.nist.gov/vuln/detail/CVE-2023-20938 "CVE-2023-20938")

[CVE-2019-2025: Waterdrop](https://www.youtube.com/watch?v=l38YQxrk7V8 "CVE-2019-2025: Waterdrop")

[CVE-2019-2215: Bad Binder](https://googleprojectzero.blogspot.com/2019/11/bad-binder-android-in-wild-exploit.html "CVE-2019-2215: Bad Binder")

[CVE-2020-0423: Typhoon Mangkhut](https://www.youtube.com/watch?v=a1vyt6iWmS4 "CVE-2020-0423: Typhoon Mangkhut")

[CVE-2022-20421: Bad Spin](https://github.com/0xkol/badspin "CVE-2022-20421: Bad Spin")



## Methodologies

The program uses the following tools:

1. **Decompilation**:
   - **JADX**: Decompiles APK files to Java source code.
   - **APKTool**: Decompiles APK files to Smali code and resources.
   - **Dex2Jar**: Converts APK files to Java .class files.
   
2. **Endpoint Extraction using *Grep & Regex* for compatibility**:
   - Uses regular expressions to search for URLs, URIs, and IP addresses in the decompiled code.
   - Outputs the extracted endpoints to an ordered text file for further analysis. 
   *Please note that a large portion of most apks will contain Android Schema Developer links in the original output. 
 - Endpoint URL/URI will also show the activity of origin, and filetype. 
 Useful for finding strings - pointers - binders in source.
 - Can be use for Class & Member Mapping 
 - Extract Mappings between original class / member names & their obfuscated equivalents.


## Example Output


### Endpoints


```
Generic-APK-5-39-2_decompiled/res/raw/ic_car_mode.svg:http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd
Generic-APK-5-39-2_decompiled/res/raw/ic_car_mode.svg:http://www.inkscape.org/namespaces/inkscape
Generic-APK-5-39-2_decompiled/res/raw/ic_car_mode.svg:http://www.w3.org/1999/02/22-rdf-syntax-ns#
Generic-APK-5-39-2_decompiled/res/raw/ic_car_mode.svg:http://www.w3.org/2000/svg
Generic-APK-5-39-2_decompiled/res/raw/ic_cellular_signal_0_bar.svg:http://www.w3.org/2000/svg
Generic-APK-5-39-2_decompiled/smali_classes2/h/o.smali:http://apache.org/xml/features/disallow-doctype-decl
Generic-APK-5-39-2_decompiled/smali_classes2/h/o.smali:http://xml.org/sax/features/external-parameter-entities
Generic-APK-5-39-2_decompiled/smali_classes2/h/r.smali:http://ns.adobe.com/exif/1.0/
Generic-APK-5-39-2_decompiled/smali_classes2/h/r.smali:http://ns.adobe.com/xap/1.0/mm/
Generic-APK-5-39--2_decompiled/unknown/google/protobuf/empty.proto:https://developers.google.com/protocol-buffers/

```

### Binders


```

c com.facebook.acra.anr.multisignal.MultiSignalANRDetector$2$2 = RunnableC00002
c com.google.common.base.Splitter$1$1 = C00011
c com.mapbox.mapboxsdk.maps.NativeMapView$1$1 = C00021
c com.mapbox.mapboxsdk.maps.NativeMapView$1$1$1 = RunnableC00031
f X.0C5.final:Ljava/lang/Object; = f0final
m X.RLb.lambda$setRemoteJSDebugEnabled$14$com-facebook-react-devsupport-DevSupportManagerBase(Z)V = m10xf307a37b
m X.RLb.lambda$showDevOptionsDialog$3$com-facebook-react-devsupport-DevSupportManagerBase()V = m11x19d31cd0
m X.RLb.lambda$showDevOptionsDialog$4$com-facebook-react-devsupport-DevSupportManagerBase()V = m12xa70dce51
m X.RLb.lambda$showDevOptionsDialog$5$com-facebook-react-devsupport-DevSupportManagerBase()V = m13x34487fd2
m X.RLb.lambda$showDevOptionsDialog$6$com-facebook-react-devsupport-DevSupportManagerBase()V = m14xc1833153

```
### Prerequisites

Ensure that Java is installed on your system. If not, please install Java before proceeding. 

## Install


```
git clone https://github.com/clock-skew/EndPointX && cd EndPointX
```

You can install the necessary tools using ```apt``` on debian or by using the install script below: 
> Please remember to **symlink** your installs if you use **aptitude**.  
- **APKtool**
- **Dex2jar**
- **Jadx**
- **Smali - Baksmali**
### Install Script
 Using the provided install script may not / will not work on all distros. Please to refer to installation documentation of requirements per distribution if the install script fails. This script creates a wrapper for APKtool that runs ```apktool.jar``` with ```java -jar.``` making the install executable by simply typing ```apktool```. It does the same for the other tools as well, moving appropriate files to ```/usr/local/bin``` & ```/usr/bin```. It then creates  a symbolic link for the program(s).

```bash
chmod +x install.sh
sudo ./install.sh
```

## Usage

### Ensure that  APK(s) are located in the apk directory:

```
~/EndPointX/apk/
```

#### This script requires root!

```bash
sudo ./decompile.sh
```

or

```bash
sudo ./decompile.sh    /path/to/your.apk
```

## Output

Most apk files will fully decompile and the endpoints will be in the ```output``` directory along with the Jadx job file, howerver if the jobf is not in output, it will be in the ```apk``` directory. If the apk fails to decompile it may leave behind partial output files, and/or error logs, so be sure to check for additional files/dirs after the operation is complete.

### **Credits**

------------


 **[n0mi1k](https://github.com/n0mi1k/apk2url "n0mi1k/apk2url")**
 
**[0xkol](https://github.com/0xkol "0xkol")**


------------


#### License

This project is distributed under the [MIT License.](https://choosealicense.com/licenses/mit/ "MIT License")
