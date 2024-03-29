#! /bin/sh

#JAVA_HOME=~/Library/Java/JDK1.6
APP_HOME=`pwd`/../ROOT
JETTY_HOME=~/jetty

#cp=.:$JAVA_HOME/lib/tools.jar:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/jre/rt.jar
cp="."
cp=$cp:$APP_HOME/WEB-INF/classes

cd $APP_HOME/WEB-INF/lib
for i in `ls | grep ".jar"`
do
	if [ -f $i ] ; then
        cp=$cp:$PWD/$i
	fi
done

cd $JETTY_HOME
for i in `ls | grep ".jar"`
do
	if [ -f $i ] ; then
        cp=$cp:$PWD/$i
	fi
done

#echo $CLASS_PATH;
export CLASSPATH=$cp

java org.vtest.VTestLauncher

