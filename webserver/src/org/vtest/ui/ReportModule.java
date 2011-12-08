package org.vtest.ui;

import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.vtest.model.Report;

@InjectName
@IocBean
@At("/report")
public class ReportModule extends BasicModule<Report> {}
