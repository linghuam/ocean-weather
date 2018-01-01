# -*- coding: UTF-8 -*-

# 汇总所有流程
# http://resources.arcgis.com/zh-cn/home/
# http://blog.csdn.net/dahongdahong/article/details/51447680
# http://blog.sina.com.cn/s/blog_9cdd59860102wsld.html Python导入arcpy问题
# 切片时间：0-8级 5分钟

import os,sys,time,datetime,shutil
import arcpy

# 不加后两行会报错
reload(sys)
sys.setdefaultencoding('utf8')

# 构建栅格金字塔
arcpy.env.pyramid = "PYRAMIDS -1 BILINEAR LZ77 NO_SKIP"
arcpy.env.resamplingmethod = "BILINEAR"

# 1、csv文件转化为shp文件
'''
csvPath = basepath + "input/data.csv"
shpPath = basepath + "output/pointsShp.shp"
prjPath = basepath + "input/GCS_WGS_1984.prj"
'''
def CsvToShp(csvPath, shpPath, prjPath, xField = "Longitude", yField = "Latitude", zField = "Value"):
    shpdirname = os.path.dirname(shpPath)
    basename = os.path.basename(shpPath)
    dotindex = basename.index('.')
    shpname = basename[0:dotindex]

    # Set the local variables
    in_Table = csvPath
    x_coords = xField
    y_coords = yField
    z_coords = zField
    out_Layer = "points_layer"

    # Set the spatial reference--this is simply a path to a .prj file
    spRef = prjPath

    # Make the XY event layer...
    arcpy.MakeXYEventLayer_management(in_Table, x_coords, y_coords, out_Layer, spRef, z_coords)

    # Now convert to a feature class
    arcpy.FeatureClassToFeatureClass_conversion (out_Layer, shpdirname, shpname)
    return shpPath


# 2、shp文件插值生成tif栅格文件
'''
shpPath = basepath + "output/pointsShp.shp"
outRasterPath = basepath + "output/outRaster.tif"
'''
def ShpToTif(shpPath, outRasterPath, zField = "Value"):
    # Set local variables
    inPointFeatures = shpPath
    zField = zField
    outRaster = outRasterPath
    cell_size = 0.1

    # Check out the ArcGIS 3D Analyst extension license
    arcpy.CheckOutExtension("3D")

    # Execute IDW
    arcpy.Idw_3d(inPointFeatures, zField, outRaster, cell_size)

    return outRasterPath


# 3、栅格文件裁剪生成移除陆地后的栅格文件
'''
rasterPath = outRasterPath
maskPath = basepath + "input/ocean_area_mask_shp/oceaArea.shp"
outDir = basepath + "output/extractRaster"
tifDir = basepath + "output"
'''
def RasterClip(rasterPath, maskPath, outDir, tifDir):
    # Set local variables
    inRaster = rasterPath
    inMaskData = maskPath

    # Check out the ArcGIS Spatial Analyst extension license
    arcpy.CheckOutExtension("Spatial")

    # Execute ExtractByMask
    outExtractByMask = arcpy.sa.ExtractByMask(inRaster, inMaskData)

    # Save the output and format tif
    outExtractByMask.save(outDir)
    outname = os.path.split(outDir)[1]
    arcpy.RasterToOtherFormat_conversion(outDir, tifDir, "TIFF")
    return tifDir + '/' + outname + '.tif'


# 4、裁剪后的栅格文件生成mxd文件
'''
rasterPath = basepath +  "output/extractRaster.tif"
templateMxdPath = basepath + "input/nullmxd.mxd"
'''
def CreateMxd(rasterPath, templateMxdPath):
    dirname = os.path.dirname(rasterPath)
    imagename = os.path.basename(rasterPath)
    dotindex = imagename.index('.')
    name = imagename[0:dotindex]
    new_mxd = os.path.abspath(dirname + "/" + name + ".mxd")
    rasterLayer = "raster"

    temp_mxd = arcpy.mapping.MapDocument(templateMxdPath)
    df = arcpy.mapping.ListDataFrames(temp_mxd, "Layers")[0]
    arcpy.MakeRasterLayer_management(rasterPath, rasterLayer, "", "", "")
    addLayer = arcpy.mapping.Layer(rasterLayer)
    arcpy.mapping.AddLayer(df, addLayer, "TOP")
    temp_mxd.saveACopy(new_mxd)
    del temp_mxd
    return new_mxd

# 为mxd生成样式
def StyleMxd(mxdpath, styleLyrpath):
    mxd = arcpy.mapping.MapDocument(mxdpath)
    df = arcpy.mapping.ListDataFrames(mxd)[0]
    updateLayer = arcpy.mapping.ListLayers(mxd)[0]
    sourceLayer = arcpy.mapping.Layer(styleLyrpath)
    arcpy.mapping.UpdateLayer(df, updateLayer, sourceLayer, False)
    mxd.save()
    del mxd, df, updateLayer, sourceLayer

# 5、发布mxd到arcserver，生成服务
'''
mxdpath = basepath + "output/extractRaster.mxd"
agspath = "C:/Users/Administrator/AppData/Roaming/ESRI/Desktop10.2/ArcCatalog/arcgis on localhost_6080 (admin).ags"
sddraftpath = basepath + "output/extractRaster.sddraft"
sdpath = basepath + "output/extractRaster.sd"
serviceName = "idwRes"
'''
def PublishService(mxdpath, agspath, sddraftpath, sdpath, serviceName = "idwRes"):
    # Define local variables
    mapDoc = arcpy.mapping.MapDocument(mxdpath)

    # Provide path to connection file
    # To create this file, right-click a folder in the Catalog window and
    #  click New > ArcGIS Server Connection
    con = agspath

    # Provide other service details
    service = serviceName
    sddraft = sddraftpath
    sd = sdpath
    if os.path.exists(sddraft): os.remove(sddraft)
    if os.path.exists(sd): os.remove(sd)
    summary = 'General reference map of the ' + serviceName
    tags = serviceName

    # Create service definition draft
    arcpy.mapping.CreateMapSDDraft(mapDoc, sddraft, service, 'ARCGIS_SERVER', con, True, None, summary, tags)

    # Analyze the service definition draft
    analysis = arcpy.mapping.AnalyzeForSD(sddraft)

    # Print errors, warnings, and messages returned from the analysis
    print "The following information was returned during analysis of the MXD:"
    for key in ('messages', 'warnings', 'errors'):
      print '----' + key.upper() + '---'
      vars = analysis[key]
      for ((message, code), layerlist) in vars.iteritems():
        print '    ', message, ' (CODE %i)' % code
        print '       applies to:',
        for layer in layerlist:
            print layer.name,
        print

    # Stage and upload the service if the sddraft analysis did not contain errors
    if analysis['errors'] == {}:
        # Execute StageService. This creates the service definition.
        arcpy.StageService_server(sddraft, sd)

        # Execute UploadServiceDefinition. This uploads the service definition and publishes the service.
        arcpy.UploadServiceDefinition_server(sd, con)
        print "Service successfully published"
    else:
        print "Service could not be published because errors were found during analysis."

    print arcpy.GetMessages()
    return agspath.replace(".ags","/" + service + ".MapServer")

# 6、对服务进行切片缓存

# 6.1 制作地图服务器缓存
'''
cachedir = basepath + "output/"
tilingSchemePath = basepath + "input/TilingSchemes/ArcGIS_Online_Bing_Maps_Google_Maps.xml"
'''
def CreateCache(inputService, cachedir, tilingSchemePath):
    # List of input variables for map service properties
    input_service = inputService
    serviceCacheDirectory = cachedir
    tilingSchemeType = "PREDEFINED"
    scalesType = ""
    tileOrigin = ""
    scalesType = ""
    numOfScales = ""
    scales = ""
    dotsPerInch = "96"
    tileSize = "256 x 256"
    cacheTileFormat = "PNG"  # 保存为PNG格式，保证裁剪区域透明;保存为JPEG时不透明。
    tileCompressionQuality = "75"
    storageFormat = "EXPLODED"
    predefinedTilingScheme = tilingSchemePath


    currentTime = datetime.datetime.now()
    arg1 = currentTime.strftime("%H-%M")
    arg2 = currentTime.strftime("%Y-%m-%d %H:%M")
    file = 'C:/data/report_%s.txt' % arg1

    # print results of the script to a report
    report = open(file,'w')

    try:
        starttime = time.clock()
        result = arcpy.CreateMapServerCache_server (input_service,
                                                    serviceCacheDirectory,
                                                    tilingSchemeType, scalesType,
                                                    numOfScales, dotsPerInch,
                                                    tileSize, predefinedTilingScheme,
                                                    tileOrigin, scales,
                                                    cacheTileFormat,
                                                    tileCompressionQuality,
                                                    storageFormat)

        finishtime = time.clock()
        elapsedtime = finishtime - starttime

        #print messages to a file
        while result.status < 4:
            time.sleep(0.2)
        resultValue = result.getMessages()
        report.write ("completed " + str(resultValue))

        print "Created cache schema using predefined tiling schema for "
        + "serviceName" + " in " + str(elapsedtime) + " sec \n on " + arg2

    except Exception, e:
        # If an error occurred, print line number and error message
        tb = sys.exc_info()[2]
        report.write("Failed at step 1 \n" "Line %i" % tb.tb_lineno)
        report.write(e.message)

    print "Executed creation of map server Cache schema using tiling scheme"
    report.close()

# 6.2生成瓦片
def CreateTiles(inputService):
    # List of input variables for map service properties
    input_service = inputService
    # scales = [591657527.591555,295828763.795777,147914381.897889,73957190.948944]
    scales = [591657527.591555,295828763.795777,147914381.897889,73957190.948944,36978595.474472,18489297.737236,9244648.868618,4622324.434309,2311162.217155]
    numOfCachingServiceInstances = 2
    updateMode = "RECREATE_ALL_TILES"
    areaOfInterest = ""
    waitForJobCompletion = "WAIT"
    updateExtents = ""

    currentTime = datetime.datetime.now()
    arg1 = currentTime.strftime("%H-%M")
    arg2 = currentTime.strftime("%Y-%m-%d %H:%M")
    file = r'C:/data/report_%s.txt' % arg1

    # print results of the script to a report
    report = open(file,'w')

    try:
        starttime = time.clock()
        result = arcpy.ManageMapServerCacheTiles_server(input_service, scales,
                                                        updateMode,
                                                        numOfCachingServiceInstances,
                                                        areaOfInterest, updateExtents,
                                                        waitForJobCompletion)
        finishtime = time.clock()
        elapsedtime= finishtime - starttime

        #print messages to a file
        while result.status < 4:
            time.sleep(0.2)
        resultValue = result.getMessages()
        report.write ("completed " + str(resultValue))

        print "Created cache tiles for given schema successfully for "
        + "serviceName" + " in " + str(elapsedtime) + " sec \n on " + arg2

    except Exception, e:
        # If an error occurred, print line number and error message
        tb = sys.exc_info()[2]
        report.write("Failed at step 1 \n" "Line %i" % tb.tb_lineno)
        report.write(e.message)
    report.close()

    print "Created Map server Cache Tiles "

def GetTimeStr():
    i = datetime.datetime.now()
    year = str(i.year)
    month = str(i.month)
    day = str(i.day)
    hour = str(i.hour)
    minute = str(i.minute)
    second = str(i.second)
    return year + month + day + hour + minute + second

def ClearFileFolder(path):
    filelist=os.listdir(path)
    for f in filelist:
        filepath = os.path.join(path, f )
        if os.path.isfile(filepath):
            os.remove(filepath)
            print filepath+" removed!"
        elif os.path.isdir(filepath):
            shutil.rmtree(filepath,True)
            print "dir "+filepath+" removed!"


#********************************************
#           主      函      数              *
#********************************************
basepath = "D:/Program Files/Apache Software Foundation/Tomcat 8.5/webapps/github/python-study/test/"

# 清空output文件夹
ClearFileFolder(basepath + "output")

# 1、csv文件转化为shp文件
csvPath = basepath + "input/data.csv"
shpPath = basepath + "output/pointsShp.shp"
prjPath = basepath + "input/GCS_WGS_1984.prj"
CsvToShp(csvPath, shpPath, prjPath)

# 2、shp文件插值生成tif栅格文件
shpPath = shpPath
outRasterPath = basepath + "output/outRaster.tif"
ShpToTif(shpPath, outRasterPath)

# 3、栅格文件裁剪生成移除陆地后的栅格文件
rasterPath = outRasterPath
maskPath = basepath + "input/ocean_area_mask_shp/oceaArea.shp"
outDir = basepath + "output/extractRaster"
tifDir = basepath + "output"
RasterClip(rasterPath, maskPath, outDir, tifDir)

# 4、裁剪后的栅格文件生成mxd文件
rasterPath = basepath +  "output/extractRaster.tif"
templateMxdPath = basepath + "input/nullmxd.mxd"
resmxdpath = basepath + "output/extractRaster.mxd"
stylepath = basepath + "input/style.lyr"
CreateMxd(rasterPath, templateMxdPath)
StyleMxd(resmxdpath, stylepath)

# 5、发布mxd到arcserver，生成服务
mxdpath = basepath + "output/extractRaster.mxd"
agspath = "C:/Users/Administrator/AppData/Roaming/ESRI/Desktop10.2/ArcCatalog/arcgis on localhost_6080 (admin).ags"
sddraftpath = basepath + "output/extractRaster.sddraft"
sdpath = basepath + "output/extractRaster.sd"
serviceName = "idwResTest"
inputService = PublishService(mxdpath, agspath, sddraftpath, sdpath, serviceName)

# 6.1 制作地图服务器缓存方案
cachedir = basepath + "output/"
tilingSchemePath = basepath + "input/TilingSchemes/ArcGIS_Online_Bing_Maps_Google_Maps.xml"
CreateCache(inputService, cachedir, tilingSchemePath)

# 6.2生成瓦片
CreateTiles(inputService)
