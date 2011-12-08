package org.vtest.ui;

import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.vtest.model.Task;

@InjectName
@IocBean
@At("/task")
public class TaskModule extends BasicModule<Task> {}
