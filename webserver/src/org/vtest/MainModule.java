package org.vtest;

import org.nutz.mvc.annotation.Fail;
import org.nutz.mvc.annotation.IocBy;
import org.nutz.mvc.annotation.Modules;
import org.nutz.mvc.annotation.Ok;
import org.nutz.mvc.annotation.SetupBy;
import org.nutz.mvc.ioc.provider.ComboIocProvider;

@Modules(scanPackage = true)
@IocBy(args = {	"*org.nutz.ioc.loader.json.JsonLoader",
				"ioc",
				"*org.nutz.ioc.loader.annotation.AnnotationIocLoader",
				"org.vtest.ui"}, type = ComboIocProvider.class)
@SetupBy(VTestSetup.class)
@Ok("json")
@Fail("json")
public class MainModule {}
