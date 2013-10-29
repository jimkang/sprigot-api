./build_stuff/uglify.sh $1
cd build_stuff
./swaptagsforprod.sh $1
cd ..
#cp sprig.css ~/gcw/gcwsite/sprigot/
cp sprig.css ~/gcw/$1/
cp glog.css ~/gcw/$1/
cp lib/underscore-min.js ~/gcw/$1/
cp lib/d3.v3.min.js ~/gcw/$1/
