package org.vtest.ui;

import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.vtest.model.Robot;

@InjectName
@IocBean
@At("/robot")
public class RobotModule extends BasicModule<Robot> {}
